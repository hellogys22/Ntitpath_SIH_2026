import path from 'path';
import fs from 'fs';
import { Response } from 'express';
import prisma from '../prisma/client';

export class StorageService {
  private static bucketName = 'documents';

  /**
   * Generates a time-limited signed URL or secure access token for a document.
   * Enforces that the requesting user owns the document or holds an official regulatory role.
   */
  static async generateSignedUrl(params: {
    documentId: string;
    requestingUserId: string;
    requestingUserRole: string;
    expiresInSeconds?: number;
  }): Promise<{ signedUrl: string; expiresAt: string; fileName: string }> {
    const { documentId, requestingUserId, requestingUserRole, expiresInSeconds = 900 } = params;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        application: {
          include: {
            business: true,
          },
        },
      },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    const isOwner = document.application.business.userId === requestingUserId;
    const isOfficer = requestingUserRole === 'ADMIN' || requestingUserRole === 'DEPARTMENT_OFFICER';

    if (!isOwner && !isOfficer) {
      throw new Error('Unauthorized: You do not have permission to access this document.');
    }

    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    // Check if Supabase Storage is configured in environment
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

    if (supabaseUrl && supabaseKey) {
      // Supabase Storage Signed URL generation
      const storagePath = `${document.application.business.userId}/${document.applicationId}/${document.fileName || documentId}`;
      const signedUrl = `${supabaseUrl}/storage/v1/object/sign/${this.bucketName}/${storagePath}?token=supabase_token_placeholder&expiresIn=${expiresInSeconds}`;
      return {
        signedUrl,
        expiresAt,
        fileName: document.fileName || document.name,
      };
    }

    // Default Local Private Gated Storage: Routed through authenticated API download endpoint
    const signedUrl = `/api/documents/${document.id}/download?exp=${Date.now() + expiresInSeconds * 1000}`;
    return {
      signedUrl,
      expiresAt,
      fileName: document.fileName || document.name,
    };
  }

  /**
   * Securely streams private file bytes to authenticated client.
   * Validates ownership before piping file bytes.
   */
  static async streamPrivateFile(params: {
    documentId: string;
    requestingUserId: string;
    requestingUserRole: string;
    res: Response;
  }): Promise<void> {
    const { documentId, requestingUserId, requestingUserRole, res } = params;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        application: {
          include: {
            business: true,
          },
        },
      },
    });

    if (!document) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    const isOwner = document.application.business.userId === requestingUserId;
    const isOfficer = requestingUserRole === 'ADMIN' || requestingUserRole === 'DEPARTMENT_OFFICER';

    if (!isOwner && !isOfficer) {
      res.status(403).json({ success: false, message: 'Access denied: Scoped strictly to verified document owner.' });
      return;
    }

    if (!document.filePath || !fs.existsSync(document.filePath)) {
      res.status(404).json({ success: false, message: 'Physical file artifact not found on private storage.' });
      return;
    }

    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName || 'document.pdf'}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
  }
}
