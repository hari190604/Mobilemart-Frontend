export const inferBrandFromName = (name) => {
  if (!name) return 'Other';
  const lowerName = name.toLowerCase();
  if (lowerName.includes('iphone') || lowerName.includes('apple') || lowerName.includes('macbook') || lowerName.includes('ipad')) return 'Apple';
  if (lowerName.includes('samsung') || lowerName.includes('galaxy')) return 'Samsung';
  if (lowerName.includes('oneplus')) return 'OnePlus';
  if (lowerName.includes('vivo')) return 'Vivo';
  if (lowerName.includes('xiaomi') || lowerName.includes('mi ') || lowerName.includes('redmi') || lowerName.includes('poco')) return 'Xiaomi/Poco';
  if (lowerName.includes('realme')) return 'Realme';
  if (lowerName.includes('google') || lowerName.includes('pixel')) return 'Google';
  if (lowerName.includes('oppo')) return 'Oppo';
  if (lowerName.includes('motorola') || lowerName.includes('moto')) return 'Motorola';
  if (lowerName.includes('nokia')) return 'Nokia';
  if (lowerName.includes('jio')) return 'Jio';
  if (lowerName.includes('infinix')) return 'Infinix';
  if (lowerName.includes('nothing')) return 'Nothing';
  if (lowerName.includes('lava')) return 'Lava';
  if (lowerName.includes('itel')) return 'Itel';
  if (lowerName.includes('micromax')) return 'Micromax';
  
  return 'Other';
};
