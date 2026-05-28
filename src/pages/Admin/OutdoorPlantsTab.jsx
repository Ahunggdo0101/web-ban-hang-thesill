import React from 'react';
import CollectionManager from '../../components/Admin/CollectionManager/CollectionManager';

export default function OutdoorPlantsTab({ fetchWithAuth }) {
  return (
    <CollectionManager
      category="outdoor-plants"
      defaultSize="medium"
      title="Cây Ngoài Trời"
      description="Sắp xếp các sản phẩm cây ngoài trời theo vị trí mong muốn trên trang bộ sưu tập khách hàng."
      fetchWithAuth={fetchWithAuth}
    />
  );
}
