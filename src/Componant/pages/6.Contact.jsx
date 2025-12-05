import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import "./Contact.css";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .send(
        "YOUR_SERVICE_ID",
        "YOUR_TEMPLATE_ID",
        {
          from_name: form.name,
          reply_to: form.email,
          phone: form.phone,
          message: form.message,
        },
        "YOUR_PUBLIC_KEY"
      )
      .then(
        () => {
          alert("Message sent successfully to the Principal!");
          setForm({ name: "", email: "", phone: "", message: "" });
        },
        () => {
          alert("Failed to send message. Try again later!");
        }
      );
  };

  return (
    <div className="contact-page">
      {/* Clip Path Header */}
      <div className="contact-header">
        <h2>Contact Us</h2>
        <p>We’d love to hear from you. Reach out anytime!</p>
      </div>

      <div className="contact-container">
        
        {/* Contact Form */}
        <form className="contact-form" onSubmit={sendEmail}>
          <h3>Send a Message</h3>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <textarea
            name="message"
            placeholder="Your Message"
            rows="5"
            value={form.message}
            onChange={handleChange}
            required
          ></textarea>

          <button type="submit">Submit</button>
        </form>

      </div>
    </div>
  );
};

export default Contact;
