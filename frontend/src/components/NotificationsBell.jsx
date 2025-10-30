import React from 'react';
import RequestsDropdown from './RequestsDropdown';

export default function NotificationsBell() {
  // For simplicity, we just render the RequestsDropdown button and list
  return (
    <div className="inline-flex items-center">
      <RequestsDropdown />
    </div>
  );
}
