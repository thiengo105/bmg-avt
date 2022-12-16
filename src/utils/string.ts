export function normalizeVietnamese(vietnameseText: string) {
  const lowserCase = vietnameseText.toLowerCase().trim();
  const replaceA = lowserCase.replace(/[áàảãạâấầẩẫậăắằẳẵặ]/g, "a");
  const replaceD = replaceA.replace(/[dđ]/g, "d");
  const replaceE = replaceD.replace(/[éèẻẽẹêếềểễệ]/g, "e");
  const replaceI = replaceE.replace(/[íìỉĩị]/g, "i");
  const replaceO = replaceI.replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, "o");
  const replaceU = replaceO.replace(/[úùủũụưứừửữự]/g, "u");
  return replaceU;
}
