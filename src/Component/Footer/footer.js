import React from 'react';
import './footer.css'; 
import FooterImage from '../assets/Footer.png'; 
import IconPhone from '../assets/IconPhone.png'; 
import IconEmail from '../assets/IconEmail.png';  
import IconAddress from '../assets/IconAddress.png'; 
import IconFacebook from '../assets/facebook.png'; 
import IconInstagram from '../assets/instagram.png'; 
import IconX from '../assets/x.png'; 

const Footer = () => {
  return (
    <footer id='footer' className="footer">

    <div className="footer">
      <img src={FooterImage} alt="Footer" className="footer-image" />
      <div className="footer-content">
          <div className="footer-links">
              <div className="footer-link">HOME</div>
              <div className="footer-dot"></div>
              <div className="footer-link">PRODUCT</div>
              <div className="footer-dot"></div>
              <div className="footer-link">SERVICES</div>
              <div className="footer-dot"></div>
              <div className="footer-link">CONTACT US</div>
          </div>
          <div className="footer-info">
              <div className="footer-contact">
                  <div className="footer-contact-item">
                      <img src={IconPhone} alt="Phone" className="footer-icon" />
                      <div className="contact-text">+84 844444444</div>
                  </div>
                  <div className="footer-contact-item">
                      <img src={IconEmail} alt="Email" className="footer-icon" />
                      <div className="contact-text">211110xxx@student.hcmute.edu.vn</div>
                  </div>
                  <div className="footer-contact-item">
                      <img src={IconAddress} alt="Address" className="footer-icon" />
                      <div className="contact-text">
                          01 Đ. Võ Văn Ngân, Linh Chiểu, Thủ Đức, Hồ Chí Minh
                      </div>
                  </div>
              </div>
              <div className="footer-logo">
                  <div className="footer-logo-text">flower shop</div>
                  <div className="footer-social-icons">
                  <div className="footer">
                      <div className="footer-social-icon">
                          <img src={IconFacebook} alt="Facebook" />
                      </div>
                      <div className="footer-social-icon">
                          <img src={IconInstagram} alt="Instagram" />
                      </div>
                      <div className="footer-social-icon">
                          <img src={IconX} alt="X" />
                      </div>
                  </div>
                  </div>
              </div>
              <div className="footer-description">
              Chúng tôi cam kết mang đến những bó hoa tươi đẹp nhất cho mọi dịp quan trọng trong cuộc sống.
              </div>
          </div>
      </div>
      <div className="footer-bottom">
          <div className="footer-bottom-text">©tt2024, all rights reserved.</div>
          <div className="footer-bottom-links">
              <div className="footer-bottom-link">Privacy policy</div>
              <div className="footer-bottom-link">Terms & Conditions</div>
              <div className="footer-bottom-link">Cookies policy</div>
          </div>
      </div>
  </div>
  </footer>
  );
};
export default Footer;
