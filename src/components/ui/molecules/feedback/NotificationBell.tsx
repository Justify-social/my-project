import Image from 'next/image';

export interface NotificationBellProps {
  count?: number;
  onClick?: () => void;
}

export default function NotificationBell({ count, onClick }: NotificationBellProps) {
  return (
    <div 
      className="relative cursor-pointer" 
      onClick={onClick}
    >
      <Image 
        src="/bell.svg" 
        alt="Notifications"
        width={24}
        height={24}
        style={{ width: 'auto', height: 'auto' }}
        priority
      />
      {count !== undefined && count > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  );
} 