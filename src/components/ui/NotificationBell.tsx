import Image from 'next/image';

export default function NotificationBell() {
  return (
    <Image 
      src="/bell.svg" 
      alt="Notifications"
      width={24}
      height={24}
      style={{ width: 'auto', height: 'auto' }}
      priority
    />
  );
} 