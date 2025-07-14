import divisionsRaw from './divisions.json';
import districtsRaw from './districts.json';
import upazilasRaw from './upazilas.json';
import areaData from './area.json';
// import unionsRaw from './unions.json';

// Helper to extract the data array from the JSON structure
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractData(raw: any[]): any[] {
  const table = raw.find((item) => item.type === 'table');
  return table ? table.data : [];
}

export const getDivisions = () => extractData(divisionsRaw);

export const getDistrictsByDivision = (divisionId: string) =>
  extractData(districtsRaw).filter((d) => d.division_id === divisionId);

export const getUpazilasByDistrict = (districtId: string) =>
  extractData(upazilasRaw).filter((u) => u.district_id === districtId);

// Returns the area list for a given upazila_id
export const getAreasByUpazilaId = (upazilaId: number) => {
  const upazila = areaData.find((item) => item.upazila_id === upazilaId);
  if (!upazila) return [];
  return upazila.areas || [];
};

// Returns all area objects (with upazila_id, district_id, name, bn_name, areas, bn_areas)
export const getAllAreas = () => areaData; 