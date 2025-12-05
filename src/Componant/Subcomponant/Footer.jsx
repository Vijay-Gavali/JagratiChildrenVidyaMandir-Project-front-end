import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">

      {/* Clip-Path Curved Top */}
      <div className="footer-curve"></div>

      <div className="footer-container">

        {/* Column 1 */}
        <div className="footer-section">
          <h3>Jagrati Children Vidhya Mandir</h3>
          <p>
            Providing quality education with discipline, values and all-round
            development for every child. We believe in building a bright future.
          </p>
        </div>

        {/* Column 2 */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/academic">Academics</a></li>
            <li><a href="/gallery">Gallery</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* Column 3 */}
        <div className="footer-section">
          <h3>Contact</h3>
          <p><strong>Address:</strong><br />
            Shankar Colony, Gol Phadiya, Lashkar,  
            Gwalior, Madhya Pradesh
          </p>
          <p><strong>Phone:</strong> </p>
          <p><strong>Email:</strong> Jcvmschool@gmail.com</p>
        </div>

        {/* Column 4 */}
        <div className="footer-section">
          <h3>Find Us</h3>
          <iframe
            title="footer-map"
            src="https://www.google.co.in/maps/place/Shankar+Colony,+Sikandar+Kampoo,+Gwalior,+Madhya+Pradesh+474001/@26.1798625,78.1292223,17z/data=!3m1!4b1!4m7!3m6!1s0x3976c5bdfdf9c7b5:0xcdb8f3f4638afe81!8m2!3d26.1799875!4d78.1341725!15sCjtTaGFua2FyIGNvbG9ueSBnb2wgcGFoYWRpeWEgbGFzaGthciBnd2FsaW9yLCBtYWRoeWEgcHJhZGVzaJIBDG5laWdoYm9yaG9vZKoBdRABKhAiDGdvbCBwYWhhZGl5YSgAMh8QASIbNjQy8peDGU5u3OUu3jvx4pm2BODMEE16c8ZbMj4QAiI6c2hhbmthciBjb2xvbnkgZ29sIHBhaGFkaXlhIGxhc2hrYXIgZ3dhbGlvciBtYWRoeWEgcHJhZGVzaOABAA!16s%2Fg%2F11hbkgmd3l?entry=tts&g_ep=EgoyMDI1MTExNy4wIPu8ASoASAFQAw%3D%3D&skid=fcdbe9b5-1894-4988-bab3-8fac9842a6b1"
            width="100%"
            height="150"
            style={{ border: 0, borderRadius: "10px" }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Jagrati Children Vidhya Mandir — All Rights Reserved.
      </div>

    </footer>
  );
};

export default Footer;
