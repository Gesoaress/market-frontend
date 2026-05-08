export default function WinWindow({ children, className = '' }) {
  return (
    <div className={`win ${className}`}>
      {children}
    </div>
  );
}