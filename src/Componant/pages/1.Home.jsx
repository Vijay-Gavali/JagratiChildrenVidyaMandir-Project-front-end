import React from "react";
import "./Home.css";

// Images
import background1 from "../../media/background1.jpeg";
import Carrom from "../../media/Sportsimage/Carrom.jpeg";
import batsman2 from "../../media/Sportsimage/batsman2.jpeg";
import certificte from "../../media/Sportsimage/certificte.jpeg";
import Cricketgroup from "../../media/Sportsimage/Cricketgroup.jpeg";
import Criketteam from "../../media/Sportsimage/Criketteam.jpeg";
import gameblune from "../../media/Sportsimage/gameblune.jpeg";
import masti1 from "../../media/Sportsimage/masti1.jpeg";
import member1 from "../../media/Sportsimage/member1.jpeg";
import membar2 from "../../media/Sportsimage/membar2.jpeg";

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1>WELCOM TO JAGRATI CHILDREN VIDHYA MANDIR SCHOOL</h1>
          <p>Where Learning is Fun & Every Child Shines Bright!</p>
          <button className="admission-btn">Apply Now</button>
          
        </div>
      </section>

      {/* Leadership Section */}
      <section className="principal-section">
        <h2>Meet Our Leadership</h2>
        <div className="principal-wrapper">

          {/* Principal – Big Card */}
          <div className="leader-card principal-card">
            <div className="principal-image-box">
              <img
                src="/mnt/data/00a56a90-9497-4350-814b-0b258bda991b.jpg"
                alt="Principal"
                className="leader-img"
              />
              <img
                src="/mnt/data/00a56a90-9497-4350-814b-0b258bda991b.jpg"
                alt="small-logo"
                className="small-logo"
              />
            </div>
            <h3>Mr. Rajesh Kushwah</h3>
            <p className="leader-role">Principal</p>
            <p className="leader-text">
              Education – BSC, D.El.Ed <br />
              Leading the school with dedication since 2007. <br />
              Experience in school administration, academic planning, and extracurricular activities. <br />
              Awards: Best Principal Award 2019, Innovative Education Leadership 2022.
              
            </p>
             <div className="leader-contact">
    <p>Email: <a href="Jcvmschool@gmail.com">Jcvmschool@gmail.com</a></p>
    <p>Phone: <a href="tel:+919827366274">+91 9827366274</a></p>
  </div>
          </div>

          {/* Vice Principal – Small Card */}
          <div className="leader-card vp-card">
            <div className="principal-image-box">
              <img
                src="https://via.placeholder.com/200"
                alt="Vice Principal"
                className="leader-img"
              />
            </div>
            <h3>Mrs. Anita Kushwah</h3>
            <p className="leader-role">Vice Principal</p>
            <p className="leader-text">
              Supporting innovation and student growth. <br />
              Focused on discipline, student care, and extracurricular activities.
            </p>
          </div>

        </div>
      </section>

      {/* Image Slider */}
      <section className="card-slider-container">
        <div className="card-slider">
          {[Carrom, Criketteam, gameblune, masti1, member1, membar2, Cricketgroup, Carrom, Cricketgroup, gameblune].map((img, index) => (
            <div className="card-item" key={index}>
              <img src={img} alt={`slide-${index}`} />
            </div>
          ))}
        </div>
      </section>

      {/* Highlights Section */}
      <section className="highlights">
        <h2>Why Choose Us?</h2>
        <div className="highlight-cards">
          <div className="card">
            <h3>🌟 Creative Learning Hub</h3>
            <p>Where imagination meets knowledge through hands-on activities.</p>
          </div>
          <div className="card">
            <h3>Expert Teaching Faculty</h3>
            <p>Highly skilled educators committed to building strong academic foundations.</p>
          </div>
          <div className="card">
            <h3>Safe Environment</h3>
            <p>Secure and nurturing classrooms for every child.</p>
          </div>
          <div className="card">
            <h3>Arts & Sports</h3>
            <p>Opportunities to explore creativity, music, and sports.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Enroll Your Child Today!</h2>
        <button className="admission-btn">Apply Now</button>
      </section>
    </>
  );
};

export default Home;
