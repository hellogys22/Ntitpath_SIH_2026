import { DependencyGraphNode } from '../types';

export interface TopologicalSortResult {
  sortedNodes: DependencyGraphNode[];
  hasCycle: boolean;
  criticalPath: DependencyGraphNode[];
  totalCriticalPathDays: number;
  parallelTracks: { [group: string]: DependencyGraphNode[] };
}

export function computeDependencyGraph(nodes: DependencyGraphNode[]): TopologicalSortResult {
  const nodeMap = new Map<string, DependencyGraphNode>();
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  nodes.forEach((node) => {
    nodeMap.set(node.code, node);
    inDegree.set(node.code, 0);
    adjacency.set(node.code, []);
  });

  nodes.forEach((node) => {
    node.dependencies.forEach((depCode) => {
      if (adjacency.has(depCode)) {
        adjacency.get(depCode)!.push(node.code);
        inDegree.set(node.code, (inDegree.get(node.code) || 0) + 1);
      }
    });
  });

  const queue: string[] = [];
  inDegree.forEach((deg, code) => {
    if (deg === 0) queue.push(code);
  });

  const sortedNodes: DependencyGraphNode[] = [];
  const inDegreeCopy = new Map(inDegree);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const node = nodeMap.get(curr);
    if (node) sortedNodes.push(node);

    const neighbors = adjacency.get(curr) || [];
    for (const next of neighbors) {
      inDegreeCopy.set(next, (inDegreeCopy.get(next) || 1) - 1);
      if (inDegreeCopy.get(next) === 0) {
        queue.push(next);
      }
    }
  }

  const hasCycle = sortedNodes.length !== nodes.length;

  // Compute Critical Path using Dynamic Programming on DAG
  const earliestFinish = new Map<string, number>();
  const predecessor = new Map<string, string | null>();

  sortedNodes.forEach((node) => {
    let maxPrevFinish = 0;
    let bestPred: string | null = null;

    node.dependencies.forEach((depCode) => {
      const depFinish = earliestFinish.get(depCode) || 0;
      if (depFinish > maxPrevFinish) {
        maxPrevFinish = depFinish;
        bestPred = depCode;
      }
    });

    earliestFinish.set(node.code, maxPrevFinish + node.slaDays);
    predecessor.set(node.code, bestPred);
  });

  // Find max finish node
  let maxEndCode = '';
  let maxDays = 0;
  earliestFinish.forEach((days, code) => {
    if (days > maxDays) {
      maxDays = days;
      maxEndCode = code;
    }
  });

  // Reconstruct critical path
  const criticalPath: DependencyGraphNode[] = [];
  let curr: string | null = maxEndCode;
  while (curr) {
    const node = nodeMap.get(curr);
    if (node) criticalPath.unshift(node);
    curr = predecessor.get(curr) || null;
  }

  // Group into parallel tracks
  const parallelTracks: { [group: string]: DependencyGraphNode[] } = {};
  nodes.forEach((n) => {
    const group = n.parallelGroup || 'GENERAL_TRACK';
    if (!parallelTracks[group]) parallelTracks[group] = [];
    parallelTracks[group].push(n);
  });

  return {
    sortedNodes,
    hasCycle,
    criticalPath,
    totalCriticalPathDays: maxDays,
    parallelTracks,
  };
}
