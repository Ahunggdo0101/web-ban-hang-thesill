import React from 'react';
import CollectionManager from '../../components/Admin/CollectionManager/CollectionManager';

export default function LargePlantsTab({ fetchWithAuth }) {
  return (
    <CollectionManager
      category="large-plants"
      defaultSize="large"
      title="Cây Cỡ Lớn"
      description="Sắp xếp các sản phẩm cây cỡ lớn và khổng lồ theo vị trí mong muốn trên trang bộ sưu tập khách hàng."
      fetchWithAuth={fetchWithAuth}
    />
  );
}
