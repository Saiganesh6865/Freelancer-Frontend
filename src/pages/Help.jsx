import React, { useState } from 'react';
import './Help.css';

const Help = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const faqData = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: [
        {
          question: 'How do I create an account?',
          answer: 'Click on "Sign Up" in the navigation bar and fill out the registration form with your username, email, and password.'
        },
        {
          question: 'How do I browse projects?',
          answer: 'Navigate to the "Projects" page to see all available freelance projects. You can view project details and submit requests.'
        },
        {
          question: 'How do I apply for a project?',
          answer: 'Click "Request Project" on any project card, write a message explaining why you\'re the best fit, and submit your request.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account Management',
      content: [
        {
          question: 'How do I update my profile?',
          answer: 'Go to "Settings" to update your account information, change your password, or manage your preferences.'
        },
        {
          question: 'How do I change my password?',
          answer: 'In Settings, enter your current password and then your new password twice to confirm the change.'
        },
        {
          question: 'How do I logout?',
          answer: 'Click the "Logout" button in the Settings page or use the logout option in your account menu.'
        }
      ]
    },
    {
      id: 'projects',
      title: 'Working with Projects',
      content: [
        {
          question: 'How do I track my project requests?',
          answer: 'Your project requests and their status can be viewed in your dashboard under "Recent Requests".'
        },
        {
          question: 'What happens after I submit a request?',
          answer: 'Your request will be reviewed by the project owner. You\'ll be notified of the decision via email or in your dashboard.'
        },
        {
          question: 'Can I cancel a project request?',
          answer: 'Currently, project requests cannot be cancelled once submitted. Please review carefully before submitting.'
        }
      ]
    },
    {
      id: 'communication',
      title: 'Communication',
      content: [
        {
          question: 'How do I chat with other users?',
          answer: 'Navigate to the "Chat" page to join the community chat and connect with other freelancers.'
        },
        {
          question: 'Is the chat real-time?',
          answer: 'Yes, the chat feature uses real-time messaging so you can communicate instantly with other users.'
        },
        {
          question: 'Can I send private messages?',
          answer: 'Currently, only public community chat is available. Private messaging may be added in future updates.'
        }
      ]
    }
  ];

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Help & Support</h1>
          <p>Find answers to common questions and get support</p>
        </div>

        <div className="help-container">
          <div className="help-sidebar">
            {faqData.map((section) => (
              <button
                key={section.id}
                className={`help-nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.title}
              </button>
            ))}
          </div>

          <div className="help-content">
            {faqData.map((section) => (
              <div
                key={section.id}
                className={`help-section ${activeSection === section.id ? 'active' : ''}`}
              >
                <h2 className="help-section-title">{section.title}</h2>
                
                <div className="faq-list">
                  {section.content.map((item, index) => (
                    <div key={index} className="faq-item">
                      <h3 className="faq-question">{item.question}</h3>
                      <p className="faq-answer">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card mt-2">
          <div className="card-header">
            <h2 className="card-title">Contact Support</h2>
          </div>
          
          <div className="support-info">
            <div className="support-item">
              <strong>Email:</strong> support@lancelink.com
            </div>
            <div className="support-item">
              <strong>Response Time:</strong> Within 24 hours
            </div>
            <div className="support-item">
              <strong>Hours:</strong> Monday - Friday, 9 AM - 6 PM EST
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help; 