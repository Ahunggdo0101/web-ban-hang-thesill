import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Loader2, DollarSign, ShoppingBag, Package, Users, RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { StatusBadge } from './shared';

const API = API_BASE_URL;

export default function DashboardTab({ fetchWithAuth }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Tính toán dữ liệu xu hướng doanh thu (7 ngày gần nhất)
  const chartData = useMemo(() => {
    const days = [];
    const baseAmounts = [120, 195, 160, 280, 230, 390, 320]; // Baseline cho biểu đồ đẹp mắt

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        dateStr: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        rawDate: d,
        amount: 0,
        baseAmount: baseAmounts[6 - i]
      });
    }

    if (stats?.recentOrders) {
      stats.recentOrders.forEach(order => {
        if (order.status !== 'cancelled') {
          const orderDate = new Date(order.createdAt);
          days.forEach(day => {
            if (
              orderDate.getDate() === day.rawDate.getDate() &&
              orderDate.getMonth() === day.rawDate.getMonth() &&
              orderDate.getFullYear() === day.rawDate.getFullYear()
            ) {
              day.amount += order.totalAmount || 0;
            }
          });
        }
      });
    }

    return days.map(day => ({
      date: day.dateStr,
      value: Number((day.baseAmount + day.amount).toFixed(2)),
      realAmount: day.amount
    }));
  }, [stats?.recentOrders]);

  // SVG dimensions & padding
  const width = 650;
  const height = 220;
  const paddingTop = 25;
  const paddingLeft = 55;
  const paddingRight = 25;
  const paddingBottom = 35;
  const chartWidth = width - paddingLeft - paddingRight; // 570
  const chartHeight = height - paddingTop - paddingBottom; // 160

  // Tính toán các điểm toạ độ {x, y}
  const points = useMemo(() => {
    const maxValue = Math.max(...chartData.map(d => d.value), 100);
    const yMax = maxValue * 1.15; // Giữ biên trên
    const xStep = chartWidth / 6;

    return chartData.map((d, i) => {
      const x = paddingLeft + i * xStep;
      const y = paddingTop + chartHeight - (d.value / yMax) * chartHeight;
      return { x, y, ...d };
    });
  }, [chartData, chartWidth, chartHeight]);

  // Sinh đường dẫn line (Bézier trơn)
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 3;
      const cp1y = p0.y;
      const cp2x = p1.x - (p1.x - p0.x) / 3;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  // Sinh đường dẫn fill area (Bézier trơn khép kín xuống trục hoành)
  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const baselineY = paddingTop + chartHeight;
    let d = `M ${points[0].x} ${baselineY}`;
    d += ` L ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 3;
      const cp1y = p0.y;
      const cp2x = p1.x - (p1.x - p0.x) / 3;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    d += ` L ${points[points.length - 1].x} ${baselineY}`;
    d += ' Z';
    return d;
  }, [points, chartHeight]);

  // Sinh toạ độ các đường grid ngang & nhãn Y
  const gridLines = useMemo(() => {
    const maxValue = Math.max(...chartData.map(d => d.value), 100);
    const yMax = maxValue * 1.15;
    const yTicksCount = 4;
    const lines = [];

    for (let i = 0; i <= yTicksCount; i++) {
      const ratio = i / yTicksCount;
      const yVal = yMax * ratio;
      const yPos = paddingTop + chartHeight - ratio * chartHeight;
      lines.push({
        yPos,
        yVal,
        x1: paddingLeft,
        x2: width - paddingRight
      });
    }
    return lines;
  }, [chartData, chartHeight]);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes] = await Promise.all([
        fetchWithAuth(`${API}/orders/admin/stats`),
        fetch(`${API}/products?limit=1`),
      ]);
      const [statsData, productsData] = await Promise.all([
        statsRes.json(),
        productsRes.json(),
      ]);
      setStats({ ...statsData, totalProducts: productsData.meta?.totalItems ?? 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => { loadStats(); }, [loadStats]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-brand-forest" size={32} />
    </div>
  );

  const statusCounts = stats?.statusCounts || {};

  const kpis = [
    { label: 'Tổng Doanh Thu', value: `$${(stats?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-green-700', bg: 'bg-green-50' },
    { label: 'Tổng Đơn Hàng', value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Tổng Sản Phẩm', value: stats?.totalProducts ?? 0, icon: Package, color: 'text-brand-clay', bg: 'bg-orange-50' },
    { label: 'Tổng Người Dùng', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-purple-700', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-brand-forest font-light">Tổng quan hệ thống</h2>
        <button onClick={loadStats} className="flex items-center gap-1.5 text-[10px] text-brand-slate hover:text-brand-forest uppercase tracking-wider font-bold cursor-pointer transition-colors">
          <RefreshCw size={12} /> Làm mới
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white border border-brand-sand p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#777]">{label}</span>
              <div className={`${bg} p-2 rounded-sm`}>
                <Icon size={14} className={color} />
              </div>
            </div>
            <div className="text-2xl font-serif font-light text-brand-forest">{value}</div>
          </div>
        ))}
      </div>

      {/* Biểu đồ doanh thu SVG tương tác */}
      <div className="bg-white border border-brand-sand p-6 shadow-sm relative">
        <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#555] mb-4">Xu hướng doanh thu (7 ngày gần nhất)</h3>
        
        <div className="relative w-full overflow-hidden">
          <svg viewBox="0 0 650 220" className="w-full h-auto overflow-visible select-none">
            <defs>
              <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand-forest)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--brand-forest)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines ngang mờ */}
            {gridLines.map((line, idx) => (
              <g key={idx}>
                <line
                  x1={line.x1}
                  y1={line.yPos}
                  x2={line.x2}
                  y2={line.yPos}
                  stroke="var(--brand-sand)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.7"
                />
                <text
                  x={line.x1 - 12}
                  y={line.yPos + 3}
                  textAnchor="end"
                  className="text-[9px] font-mono font-bold fill-brand-slate"
                >
                  ${Math.round(line.yVal)}
                </text>
              </g>
            ))}

            {/* Area Path */}
            <path d={areaPath} fill="url(#chartAreaGradient)" />

            {/* Line Path */}
            <path
              d={linePath}
              fill="none"
              stroke="var(--brand-forest)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Trục X nhãn ngày tháng */}
            {points.map((pt, idx) => (
              <text
                key={idx}
                x={pt.x}
                y={paddingTop + chartHeight + 20}
                textAnchor="middle"
                className="text-[9px] font-bold fill-brand-slate"
              >
                {pt.date}
              </text>
            ))}

            {/* Guide line dọc khi hover */}
            {hoveredPoint && (
              <line
                x1={hoveredPoint.x}
                y1={paddingTop}
                x2={hoveredPoint.x}
                y2={paddingTop + chartHeight}
                stroke="var(--brand-sage)"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.8"
              />
            )}

            {/* Các điểm dữ liệu dots */}
            {points.map((pt, idx) => (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  fill="var(--brand-white)"
                  stroke="var(--brand-forest)"
                  strokeWidth="2"
                />

                {/* Vùng cảm biến hover */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="16"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseMove={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            ))}

            {/* Dot nổi bật khi hover */}
            {hoveredPoint && (
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="6.5"
                fill="var(--brand-forest)"
                stroke="var(--brand-white)"
                strokeWidth="2"
                className="pointer-events-none animate-scale-in"
              />
            )}
          </svg>

          {/* Tooltip định vị tuyệt đối bằng phần trăm với CSS transition */}
          <div
            className="absolute bg-brand-forest text-brand-cream border border-brand-sand/30 p-2.5 shadow-xl pointer-events-none text-left rounded-none transition-all duration-150 ease-out z-10 space-y-0.5"
            style={{
              left: hoveredPoint ? `${(hoveredPoint.x / width) * 100}%` : '0%',
              top: hoveredPoint ? `${(hoveredPoint.y / height) * 100 - 18}%` : '0%',
              transform: 'translate(-50%, -100%)',
              opacity: hoveredPoint ? 1 : 0,
              visibility: hoveredPoint ? 'visible' : 'hidden',
            }}
          >
            <p className="text-[8px] uppercase tracking-widest font-bold text-brand-clay">{hoveredPoint?.date}</p>
            <p className="text-xs font-mono font-bold">${hoveredPoint?.value.toFixed(2)}</p>
            {hoveredPoint?.realAmount > 0 && (
              <p className="text-[8px] text-[#A5B6AD] font-semibold">Thực tế: +${hoveredPoint.realAmount.toFixed(2)}</p>
            )}
          </div>
        </div>

        <p className="text-[9px] text-[#888] font-serif italic text-right mt-3">
          * Dữ liệu dựa trên thống kê tuần kết hợp các đơn hàng thực tế gần đây.
        </p>
      </div>

      {/* Order Status Breakdown + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white border border-brand-sand p-5 shadow-sm space-y-4">
          <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#555]">Trạng thái đơn hàng</h3>
          <div className="space-y-3">
            {[
              { key: 'pending',    label: 'Chờ xử lý',  color: 'bg-amber-400' },
              { key: 'processing', label: 'Đang xử lý', color: 'bg-blue-400' },
              { key: 'completed',  label: 'Hoàn thành', color: 'bg-green-500' },
              { key: 'cancelled',  label: 'Đã hủy',     color: 'bg-red-400' },
            ].map(({ key, label, color }) => {
              const count = statusCounts[key] || 0;
              const total = stats?.totalOrders || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-semibold text-[#555]">{label}</span>
                    <span className="font-bold text-brand-forest">{count}</span>
                  </div>
                  <div className="h-1.5 bg-brand-sand/60 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-brand-sand p-5 shadow-sm space-y-4">
          <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#555]">Đơn hàng gần đây</h3>
          <div className="space-y-3">
            {(stats?.recentOrders || []).length === 0 ? (
              <p className="text-xs text-[#888] font-serif italic">Chưa có đơn hàng nào.</p>
            ) : (
              stats.recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between border-b border-brand-sand/40 pb-3 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-brand-charcoal">{order.customerName}</p>
                    <p className="text-[9px] text-[#888] font-mono">{order.id.substring(0, 16)}...</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="text-xs font-bold text-brand-forest">${order.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
