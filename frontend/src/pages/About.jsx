import { Zap, Target, Users, Award, Leaf } from 'lucide-react';

const About = () => {
  const team = [
    { name: 'Rajesh Kumar', role: 'CEO & Founder', initials: 'RK' },
    { name: 'Priya Sharma', role: 'CTO', initials: 'PS' },
    { name: 'Amit Singh', role: 'Head of Operations', initials: 'AS' },
    { name: 'Neha Patel', role: 'UX Designer', initials: 'NP' },
  ];

  const values = [
    {
      icon: <Leaf className="w-6 h-6" />,
      title: 'Sustainability',
      desc: 'We are committed to a greener future by supporting the EV ecosystem.',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Innovation',
      desc: 'Constantly pushing the boundaries of EV charging technology.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Community',
      desc: 'Building a strong EV community across India, one charge at a time.',
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Quality',
      desc: 'ISO-certified charging equipment and top-tier safety standards.',
    },
  ];

  return (
    <div className="dark:bg-gray-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-500 to-blue-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            About EVCharge
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">
            Powering India&apos;s
            <br />
            <span className="text-yellow-300">Electric Revolution</span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            EVCharge is India&apos;s fastest-growing EV charging network, committed to making
            electric mobility accessible and convenient for everyone.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              To accelerate India&apos;s transition to sustainable transportation by building a
              reliable, accessible, and affordable EV charging infrastructure across the country.
            </p>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
              Founded in 2023, EVCharge started with just 10 stations in Bangalore. Today, we
              operate 500+ stations across 25 cities and serve over 10,000 satisfied EV drivers
              every day.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Stations', value: '500+', color: 'from-green-400 to-green-600' },
              { label: 'Cities', value: '25+', color: 'from-blue-400 to-blue-600' },
              { label: 'Users', value: '10K+', color: 'from-purple-400 to-purple-600' },
              { label: 'kWh Served', value: '2M+', color: 'from-orange-400 to-orange-600' },
            ].map((s) => (
              <div
                key={s.label}
                className={`bg-gradient-to-br ${s.color} text-white rounded-xl p-6 text-center`}
              >
                <div className="text-3xl font-extrabold">{s.value}</div>
                <div className="text-sm mt-1 text-white/80">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="card text-center">
                <div className="inline-flex p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl mb-4">
                  {v.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Meet the Team</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">The people driving EV adoption in India</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <div key={member.name} className="card text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                {member.initials}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
