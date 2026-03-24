import { useState } from 'react';
import { contactAPI } from '../api';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactAPI.submit(form);
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: <MapPin className="w-5 h-5" />, label: 'Address', value: 'Koramangala, Bangalore, Karnataka 560034' },
    { icon: <Phone className="w-5 h-5" />, label: 'Phone', value: '+91 99999 99999' },
    { icon: <Mail className="w-5 h-5" />, label: 'Email', value: 'support@evcharging.com' },
    { icon: <Clock className="w-5 h-5" />, label: 'Support Hours', value: '24/7 Available' },
  ];

  return (
    <div className="dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Us</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Have questions or feedback? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Get in Touch
              </h2>
              {contactInfo.map((info) => (
                <div key={info.label} className="flex items-start gap-3 mb-4">
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-lg flex-shrink-0">
                    {info.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{info.label}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-blue-600 text-white">
              <h3 className="font-semibold mb-2">Emergency Support</h3>
              <p className="text-sm text-white/80 mb-3">
                Charging issue on the road? Call our 24/7 helpline.
              </p>
              <p className="text-2xl font-bold">1800-EV-HELP</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-3 card">
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Message Received!
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
                  }}
                  className="btn-secondary mt-6"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Send a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subject *
                      </label>
                      <select
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        className="input-field"
                        required
                      >
                        <option value="">Select a topic</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Booking Issue">Booking Issue</option>
                        <option value="Billing Problem">Billing Problem</option>
                        <option value="Station Issue">Station Issue</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Feedback">Feedback</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      className="input-field h-32 resize-none"
                      placeholder="Tell us how we can help you..."
                      required
                      minLength={10}
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Send Message
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
