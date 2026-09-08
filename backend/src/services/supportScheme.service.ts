import prisma from '../prisma/client';

export class SupportSchemeService {
  static async getMatchingSchemes(sector: string, investmentCr: number) {
    const allSchemes = await prisma.supportScheme.findMany({
      where: { status: 'ACTIVE' },
    });

    return allSchemes.map((scheme) => {
      let isEligible = true;
      let reason = 'Directly matches your sector and MSME scale.';

      if (scheme.sector !== 'ALL' && !scheme.sector.toLowerCase().includes(sector.toLowerCase())) {
        isEligible = false;
        reason = `Specific to ${scheme.sector} sector.`;
      }

      const estimatedSubsidy = Math.min(
        scheme.maxCapCr,
        (investmentCr * scheme.subsidyPercentage) / 100
      );

      return {
        ...scheme,
        isEligible,
        eligibilityReason: reason,
        estimatedSubsidyAmountCr: Number(estimatedSubsidy.toFixed(2)),
      };
    });
  }
}
