export const downloadJsonData = (data: any) => {
  const json = JSON.stringify(data, null, 2); // converte in JSON leggibile
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'dati.json';
  link.click();

  URL.revokeObjectURL(url); // pulizia memoria
};