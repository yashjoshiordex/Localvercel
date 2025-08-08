import { useEffect } from 'react';

interface CustomToastProps {
  content: string;
  onDismiss: () => void;
  duration?: number; // in milliseconds
}

const CustomToast = ({ content, onDismiss, duration = 3000 }: CustomToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <div
  id="customToast"
  className="toast align-items-center text-white bg-dark border-0 position-fixed bottom-0 start-50 translate-middle-x show shadow-lg rounded-25 px-3"
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
  style={{zIndex: 1080}}
>
  <div className="d-flex justify-content-between align-items-center">
    <div className="toast-body">
      Donation product saved successfully
    </div>
    <button
      type="button"
      className="btn-close btn-close-white ms-3"
      data-bs-dismiss="toast"
      aria-label="Close"
    ></button>
  </div>
</div>
  );
};

export default CustomToast;

