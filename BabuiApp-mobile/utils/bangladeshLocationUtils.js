import divisionsRaw from '../data/bd-geocode/divisions.json';
import districtsRaw from '../data/bd-geocode/districts.json';
import upazilasRaw from '../data/bd-geocode/upazilas.json';
import areaData from '../data/bd-geocode/area.json';

export function extractData(raw) {
  if (Array.isArray(raw)) {
    const table = raw.find((item) => item.type === 'table');
    return table && Array.isArray(table.data) ? table.data : [];
  }
  return [];
}

export const getDivisions = () => extractData(divisionsRaw);

export function getDistrictsByDivision(divisionId, districts) {
  if (!Array.isArray(districts)) return [];
  return districts.filter(d => d.division_id === divisionId);
}

export function getUpazilasByDistrict(districtId, upazilas) {
  console.log('getUpazilasByDistrict: districtId', districtId, typeof districtId);
  if (!districtId) return [];
  // Robust normalization: find any key that looks like district_id
  const normalizedUpazilas = upazilas.map(u => {
    let districtIdValue = u.district_id;
    if (districtIdValue === undefined) {
      for (const key of Object.keys(u)) {
        if (key.replace(/[^a-zA-Z]/g, '').toLowerCase() === 'districtid') {
          districtIdValue = u[key];
          break;
        }
      }
    }
    return { ...u, district_id: districtIdValue };
  });
  return normalizedUpazilas.filter(u => String(u.district_id) === String(districtId));
}

export const getAreasByUpazilaId = (upazilaId) => {
  return areaData.filter((a) => String(a.upazila_id) === String(upazilaId));
};

export const getAllAreas = () => areaData; 