import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Train,
  Users,
  Clock,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { isAuthenticated } from "../lib/auth";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const features = [
    {
      icon: <Train className="h-8 w-8 text-primary-600" />,
      title: "Easy Seat Selection",
      description:
        "Choose your preferred seats with our intuitive seat map interface.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary-600" />,
      title: "Group Bookings",
      description: "Book up to 7 seats at once for your family or group.",
    },
    {
      icon: <Clock className="h-8 w-8 text-primary-600" />,
      title: "Real-time Updates",
      description:
        "See seat availability in real-time as others book their seats.",
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: "Secure Booking",
      description: "Your bookings are secure with our encrypted system.",
    },
  ];

  const stats = [
    { label: "Total Seats", value: "80" },
    { label: "Rows", value: "12" },
    { label: "Max per Booking", value: "7" },
    { label: "Last Row Seats", value: "3" },
  ];

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Book Your Train Seats
            <span className="block text-primary-600">With Ease</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Reserve your preferred seats on our train with our simple and
            intuitive booking system. Choose from 80 seats across 12 rows with
            priority for same-row bookings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated() ? (
              <Link href="/book" className="btn-primary text-lg px-8 py-3">
                Book Seats Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="btn-primary text-lg px-8 py-3"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="/login" className="btn-secondary text-lg px-8 py-3">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white rounded-lg shadow-sm p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Our Booking System?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We've designed our system with user experience in mind, making seat
            booking simple and efficient.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 rounded-lg p-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600">
            Book your seats in just a few simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">1</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Create Account
            </h3>
            <p className="text-gray-600">
              Sign up for a free account to start booking seats
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">2</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Select Seats
            </h3>
            <p className="text-gray-600">
              Choose your preferred seats from our interactive seat map
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">3</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Booking
            </h3>
            <p className="text-gray-600">
              Review and confirm your seat selection
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12 bg-primary-600 rounded-lg text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Book Your Seats?</h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of satisfied customers who trust our booking system
        </p>
        {isAuthenticated() ? (
          <Link
            href="/book"
            className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg text-lg transition-colors inline-flex items-center"
          >
            Book Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        ) : (
          <Link
            href="/register"
            className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg text-lg transition-colors inline-flex items-center"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        )}
      </section>
    </div>
  );
}



