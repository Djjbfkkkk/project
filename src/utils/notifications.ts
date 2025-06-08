export const showNotification = (
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info',
  duration: number = 4000
) => {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full opacity-0`;
  
  // Set colors based on type
  const colors = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-yellow-600 text-white',
    info: 'bg-teal-600 text-white'
  };
  
  notification.className += ` ${colors[type]}`;
  notification.innerHTML = `
    <div class="flex items-center space-x-3">
      <div class="flex-1">${message}</div>
      <button class="text-white hover:text-gray-200 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.remove('translate-x-full', 'opacity-0');
  }, 100);
  
  // Add click to close
  const closeBtn = notification.querySelector('button');
  closeBtn?.addEventListener('click', () => {
    removeNotification(notification);
  });
  
  // Auto remove
  setTimeout(() => {
    removeNotification(notification);
  }, duration);
};

const removeNotification = (notification: HTMLElement) => {
  notification.classList.add('translate-x-full', 'opacity-0');
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
};