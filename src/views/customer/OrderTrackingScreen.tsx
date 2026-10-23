import React from 'react';
import { useApp } from '../../context/AppContext';
import { OrderStatus, ORDER_STATUS_SEQUENCE } from '../../lib/commerceLogic';
import {
  ChevronLeft,
  CheckCircle2,
  Truck,
  MapPin,
  HelpCircle,
} from 'lucide-react';

export const OrderTrackingScreen: React.FC = () => {
  const { orders, selectedOrderId, setActiveScreen, createSupportTicket } = useApp();
  const [supportFeedback, setSupportFeedback] = React.useState<string | null>(null);

  const order = orders.find((o) => o.id === selectedOrderId) || orders[0];

  if (!order) {
    return (
      <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-sm font-bold text-[#192E4D]">No active order selected.</p>
        <button
          type="button"
          onClick={() => setActiveScreen('tab')}
          className="mt-4 h-11 px-5 rounded-xl bg-[#08A9A2] hover:bg-[#079690] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-xs"
        >
          Return Home
        </button>
      </div>
    );
  }

  const currentStatusIndex = ORDER_STATUS_SEQUENCE.indexOf(order.status as OrderStatus);

  const statusLabels: Record<OrderStatus, { title: string; desc: string }> = {
    placed: { title: 'Order Placed', desc: 'Received and registered in system' },
    confirmed: { title: 'Payment Confirmed', desc: 'Secure payment verified' },
    processing: { title: 'Processing', desc: 'Allocated to fulfillment warehouse' },
    packed: { title: 'Packed', desc: 'Quality checked and boxed' },
    shipped: { title: 'Dispatched', desc: 'Handed over to courier partner' },
    out_for_delivery: { title: 'Out for Delivery', desc: 'Courier agent on route to doorstep' },
    delivered: { title: 'Delivered', desc: 'Successfully handed to customer' },
    cancelled: { title: 'Cancelled', desc: 'Order was cancelled' },
    refunded: { title: 'Refunded', desc: 'Payment returned to source account' },
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F8FA] pb-24 text-left">
      {/* Header with 44px tap target */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E6EAF0] px-4 py-2 flex items-center justify-between min-h-[56px]">
        <button
          type="button"
          aria-label="Back"
          onClick={() => setActiveScreen('tab')}
          className="w-11 h-11 rounded-full bg-[#F6F8FA] hover:bg-[#E6EAF0] active:scale-95 flex items-center justify-center text-[#192E4D] transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#697586] block">
            Order Tracking
          </span>
          <span className="text-xs font-mono font-black text-[#192E4D]">{order.id}</span>
        </div>

        <button
          type="button"
          onClick={() => {
            createSupportTicket(`Help needed for Order ${order.id}`, 'Please assist me regarding my order delivery.');
            setSupportFeedback('Support ticket submitted! An agent will respond promptly.');
            setTimeout(() => setSupportFeedback(null), 4000);
          }}
          className="h-11 px-3 text-xs font-bold text-[#08A9A2] hover:text-[#068e88] flex items-center gap-1 active:scale-95 transition-all"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Support</span>
        </button>
      </div>

      {supportFeedback && (
        <div className="mx-4 mt-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{supportFeedback}</span>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* CURRENT STATUS HERO CARD */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6EAF0] shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F8]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#08A9A2]/10 text-[#08A9A2] flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#08A9A2] block">
                  Current Status
                </span>
                <h2 className="text-sm font-black text-[#192E4D] capitalize">
                  {order.status.replace('_', ' ')}
                </h2>
              </div>
            </div>

            {order.courierTracking && (
              <span className="text-[11px] font-mono font-bold bg-[#F6F8FA] border border-[#E6EAF0] px-2.5 py-1 rounded-md text-[#192E4D]">
                {order.courierTracking.trackingNumber}
              </span>
            )}
          </div>

          {order.courierTracking && (
            <div className="mt-3 text-xs space-y-1">
              <div className="flex justify-between text-[#697586]">
                <span>Logistics Partner:</span>
                <span className="font-bold text-[#192E4D]">{order.courierTracking.courier}</span>
              </div>
              <div className="flex justify-between text-[#697586]">
                <span>Estimated Arrival:</span>
                <span className="font-extrabold text-emerald-700">
                  {order.courierTracking.estimatedDelivery}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* TIMELINE PROGRESS FLOW */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6EAF0] shadow-2xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#192E4D]">
            Fulfillment Journey
          </h3>

          <div className="relative pl-7 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E6EAF0]">
            {ORDER_STATUS_SEQUENCE.map((statusStep, idx) => {
              const isPast = idx <= currentStatusIndex;
              const isCurrent = idx === currentStatusIndex;
              const stepInfo = statusLabels[statusStep];
              const historyItem = order.timeline.find((t) => t.status === statusStep);

              return (
                <div key={statusStep} className="relative flex items-start gap-3">
                  {/* Step node indicator */}
                  <div
                    className={`absolute -left-7 top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white transition-all ${
                      isCurrent
                        ? 'border-[#08A9A2] text-[#08A9A2] ring-4 ring-[#08A9A2]/20'
                        : isPast
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-[#E6EAF0] text-gray-300'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    )}
                  </div>

                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-bold ${
                          isCurrent
                            ? 'text-[#08A9A2]'
                            : isPast
                            ? 'text-[#192E4D]'
                            : 'text-[#697586]'
                        }`}
                      >
                        {stepInfo.title}
                      </span>
                      {historyItem && (
                        <span className="text-[10px] text-[#697586] tabular-nums">
                          {new Date(historyItem.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#697586] mt-0.5">
                      {historyItem?.note || stepInfo.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ORDERED ITEMS */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6EAF0] shadow-2xs space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#192E4D]">
            Order Contents ({order.items.length})
          </h3>

          <div className="divide-y divide-[#F0F4F8]">
            {order.items.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.productName}
                  referrerPolicy="no-referrer"
                  className="w-12 h-14 object-cover rounded-lg border border-[#F0F4F8] shrink-0"
                />
                <div className="flex-1 text-xs">
                  <span className="font-bold text-[#192E4D] line-clamp-1">{item.productName}</span>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#697586] mt-0.5">
                    <span>Color: {item.colorName}</span>
                    {item.size && <span>• Size: {item.size}</span>}
                    <span className="tabular-nums">• Qty: {item.quantity}</span>
                  </div>
                  <span className="font-extrabold text-[#192E4D] block mt-1 tabular-nums">
                    ₹{Math.round(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GOOGLE PAY PAYMENT RECEIPT & SETTLEMENT DETAILS */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6EAF0] shadow-2xs space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-[#F0F4F8] pb-2">
            <div className="flex items-center gap-2 font-bold text-[#192E4D]">
              <div className="w-6 h-6 rounded-lg bg-[#192E4D] text-white flex items-center justify-center font-black text-[10px]">
                G
              </div>
              <span>Google Pay Settlement</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">
              {order.payment.status}
            </span>
          </div>

          <div className="space-y-1.5 pt-1 text-[#697586]">
            <div className="flex justify-between">
              <span>Paid Via:</span>
              <span className="font-bold text-[#192E4D]">{order.payment.paidVia || order.payment.method.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Settled Receiver:</span>
              <span className="font-mono font-bold text-[#08A9A2]">{order.payment.gpayReceiver || 'ayishanp1986@oksbi'}</span>
            </div>
            <div className="flex justify-between">
              <span>GPay Linked Phone:</span>
              <span className="font-mono font-bold text-[#192E4D]">+91 9072976516</span>
            </div>
            {order.payment.transactionId && (
              <div className="flex justify-between">
                <span>Ref Txn ID:</span>
                <span className="font-mono text-[#192E4D]">{order.payment.transactionId}</span>
              </div>
            )}
            {order.payment.utrNumber && (
              <div className="flex justify-between">
                <span>UTR Number:</span>
                <span className="font-mono font-bold text-[#192E4D]">{order.payment.utrNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* SHIPPING ADDRESS & INVOICE */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6EAF0] shadow-2xs space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-[#192E4D]">
            <MapPin className="w-4 h-4 text-[#08A9A2]" />
            <span>Delivery Destination</span>
          </div>
          <p className="text-[#697586] pl-6 leading-relaxed">
            {order.shippingAddress.name} — {order.shippingAddress.street},{' '}
            {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
            {order.shippingAddress.postalCode}
          </p>

          <div className="pt-2 border-t border-[#F0F4F8] flex justify-between items-center">
            <span className="font-bold text-[#192E4D]">Total Invoiced:</span>
            <span className="text-sm font-black text-[#08A9A2] tabular-nums">
              ₹{Math.round(order.amounts.total).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
