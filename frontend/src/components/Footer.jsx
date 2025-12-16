import React from 'react'; 

export default function Footer() {
  const footerStyles = {
    backgroundColor: '#f7f5ef', 
    color: '#000',              
    textAlign: 'center',         
    padding: '20px 0',         
    marginTop: '30px',
    fontSize: '0.9em'            
  };

  const linkStyles = {
    color: '#000', 
    textDecoration: 'none', 
    marginLeft: '10px'
  };

  return (
    <footer style={footerStyles}>
      <p>@2025 Music Catalog</p>
      
      <div>
        <small>
          Розроблено: 
          <a 
            href="https://www.instagram.com/ваш_інстаграм" 
            target="_blank" 
            rel="noopener noreferrer"
            style={linkStyles}
          >
            Instagram
          </a> 
          
          <a 
            href="mailto:developer@example.com"
            style={linkStyles}
          >
            Email
          </a>
        </small>
      </div>
    </footer>
  );
}