import React from 'react';
import CollectionManager from '../../components/Admin/CollectionManager/CollectionManager';

export default function IndoorPlantsTab({ fetchWithAuth }) {
  return (
    <CollectionManager
      category="indoor-plants"
      defaultSize="medium"
      title="Cây Trong Nhà"
      description="Sắp xếp các sản phẩm cây trong nhà theo vị trí mong muốn trên trang bộ sưu tập khách hàng."
      fetchWithAuth={fetchWithAuth}
    />
  );
}
