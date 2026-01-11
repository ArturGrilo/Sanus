import "../styles/in_between_waves.css";

export default function InBetweenWaves({
  color = "var(--color-primary-dark)",
  zIndex = 2,
  className = "",
}) {
  return (
    <div
        className={`sanus-in-between-waves ${className}`}
        style={{ zIndex }}
        aria-hidden="true"
    >
        {/* Wave inferior */}
        <svg 
            className="sanus-service-in-between-waves top" 
            style={{ zIndex: 2 }} 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1440 320" 
        > 
            <path 
                fill={color} 
                fillOpacity="1" 
                d="M0,128L120,154.7C240,181,480,235,720,261.3C960,288,1200,288,1320,288L1440,288V320H0Z" >
            </path> 
        </svg> 
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1440 320"
        > 
            <path 
                fill={color} 
                fillOpacity="1" 
                d="M0,32L120,32C240,32,480,32,720,64C960,96,1200,160,1320,192L1440,224L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z" >
            </path> 
        </svg>
    </div>
  );
}
