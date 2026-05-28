import React, { useState } from 'react';

export default function AddSlotsModal({ slotsLength, onSubmit, onClose }) {
  const [addSlotsCount, setAddSlotsCount] = useState(1);
  const [addSlotsPositionType, setAddSlotsPositionType] = useState('end'); // 'end', 'start', 'custom'
  const [addSlotsCustomIndex, setAddSlotsCustomIndex] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    const count = parseInt(addSlotsCount);
    if (isNaN(count) || count <= 0) {
      alert('Vui lòng nhập số lượng vị trí hợp lệ!');
      return;
    }
    onSubmit({
      count,
      positionType: addSlotsPositionType,
      customIndex: parseInt(addSlotsCustomIndex)
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0d231a]/60" onClick={onClose} />
      <div className="relative bg-brand-cream w-full max-w-md border border-brand-sand shadow-2xl animate-fade-in modal-panel z-10 p-6 space-y-4">
        <h3 className="font-serif text-base text-brand-forest uppercase tracking-wider pb-2 border-b border-brand-sand">Thêm vị trí trống mới</h3>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block text-[10px] uppercase tracking-wider font-bold text-brand-sage">Số lượng vị trí trống cần chèn</label>
            <input
              type="number"
              min="1"
              required
              value={addSlotsCount}
              onChange={e => setAddSlotsCount(e.target.value)}
              className="w-full bg-white border border-brand-sand/80 px-3 py-2 focus:outline-none focus:border-brand-forest font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-wider font-bold text-brand-sage">Vị trí chèn</label>
            <div className="space-y-1.5 pl-1">
              <label className="flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="radio"
                  name="posType"
                  checked={addSlotsPositionType === 'end'}
                  onChange={() => setAddSlotsPositionType('end')}
                  className="text-brand-forest focus:ring-brand-forest"
                />
                Cuối danh sách (Vị trí #{slotsLength + 1})
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="radio"
                  name="posType"
                  checked={addSlotsPositionType === 'start'}
                  onChange={() => setAddSlotsPositionType('start')}
                  className="text-brand-forest focus:ring-brand-forest"
                />
                Đầu danh sách (Vị trí #1)
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="radio"
                  name="posType"
                  checked={addSlotsPositionType === 'custom'}
                  onChange={() => setAddSlotsPositionType('custom')}
                  className="text-brand-forest focus:ring-brand-forest"
                />
                Chèn tại vị trí cụ thể...
              </label>
            </div>
          </div>

          {addSlotsPositionType === 'custom' && (
            <div className="space-y-1 pl-4">
              <label className="block text-[9px] uppercase tracking-wider font-bold text-[#888]">Chèn vào trước vị trí thứ:</label>
              <input
                type="number"
                min="1"
                max={slotsLength + 1}
                required
                value={addSlotsCustomIndex}
                onChange={e => setAddSlotsCustomIndex(e.target.value)}
                className="w-24 bg-white border border-brand-sand/80 px-2 py-1.5 focus:outline-none focus:border-brand-forest font-bold"
              />
              <span className="text-[9px] text-[#999] block mt-0.5">(Nhập từ 1 đến {slotsLength + 1})</span>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-2 border-t border-brand-sand/50">
            <button
              type="button"
              onClick={onClose}
              className="border border-[#bbb] hover:bg-brand-sand/20 px-4 py-2 cursor-pointer uppercase font-bold tracking-wider text-[10px]"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-brand-forest hover:bg-brand-green text-brand-cream px-5 py-2 cursor-pointer uppercase font-bold tracking-wider text-[10px]"
            >
              Xác nhận chèn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
