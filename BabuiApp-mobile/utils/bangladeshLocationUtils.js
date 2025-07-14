import divisionsRaw from '../data/bd-geocode/divisions.json';
import districtsRaw from '../data/bd-geocode/districts.json';
import upazilasRaw from '../data/bd-geocode/upazilas.json';
import areaData from '../data/bd-geocode/area.json';

export function extractData(raw) {
  const table = raw.find((item) => item.type === 'table');
  return table && Array.isArray(table.data) ? table.data : [];
}

export const getDivisions = () => extractData(divisionsRaw);

export function getDistrictsByDivision(divisionId, districts) {
  if (!Array.isArray(districts)) return [];
  return districts.filter(d => d.division_id === divisionId);
}

export function getUpazilasByDistrict(districtId, upazilas) {
  if (!Array.isArray(upazilas)) return [];
  return upazilas.filter(u => String(u.district_id) === String(districtId));
}

export const getAreasByUpazilaId = (upazilaId) => {
  // areaData is a table structure, so we need to extract data
  const areas = extractData(areaData);
  return areas.filter((a) => String(a.upazila_id) === String(upazilaId));
};

export const getAllAreas = () => extractData(areaData); 