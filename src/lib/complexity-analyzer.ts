export function analyzeComplexity(code: string): string {
  const cleanCode = code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*/g, "")
    .replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, "");

  const forLoops = (cleanCode.match(/\bfor\s*\(/g) || []).length;
  const whileLoops = (cleanCode.match(/\bwhile\s*\(/g) || []).length;
  const forEachLoops = (cleanCode.match(/\.forEach\(/g) || []).length;
  const mapCalls = (cleanCode.match(/\.map\(/g) || []).length;

  const totalLoops = forLoops + whileLoops + forEachLoops + mapCalls;

  const hasRecursion = /function\s+(\w+)[\s\S]*?\1\s*\(/.test(cleanCode);

  const lines = cleanCode.split("\n");
  let maxNesting = 0;
  let currentNesting = 0;

  for (const line of lines) {
    if (/\b(for|while)\s*\(|\.forEach\(|\.map\(/.test(line)) {
      currentNesting++;
      maxNesting = Math.max(maxNesting, currentNesting);
    }
    if (line.includes("}")) {
      currentNesting = Math.max(0, currentNesting - 1);
    }
  }

  if (hasRecursion) {
    if (cleanCode.includes("memo") || cleanCode.includes("cache")) {
      return "O(n)";
    }
    if (/\/\s*2|>>|>>>/.test(cleanCode)) {
      return "O(log n)";
    }
    return "O(2^n)";
  }

  if (maxNesting >= 3) {
    return "O(n^3)";
  } else if (maxNesting === 2) {
    return "O(n^2)";
  } else if (totalLoops > 0) {
    if (/\/\s*2|>>|>>>/.test(cleanCode)) {
      return "O(log n)";
    }
    return "O(n)";
  }

  if (/\.sort\(/.test(cleanCode)) {
    return "O(n log n)";
  }

  return "O(1)";
}
