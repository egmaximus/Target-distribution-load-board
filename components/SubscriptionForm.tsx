
import * as React from 'react';
import { addCarrierEmail } from './carrier-emails.ts';

const SubscriptionForm: React.FC = () => {
    const [email, setEmail] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [isSuccess, setIsSuccess] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const result = addCarrierEmail(email);

        setMessage(result.message);
        setIsSuccess(result.success);
        
        if (result.success) {
            setEmail('');
        }

        // Message disappears after 5 seconds
        setTimeout(() => {
            setMessage('');
        }, 5000);
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-none dark:border dark:border-gray-700 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Stay Updated on New Freight
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
                Want to be notified when freight is open for bidding? Add your email to our notification list.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <label htmlFor="email-subscription" className="sr-only">Email address</label>
                <input
                    id="email-subscription"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="youremail@company.com"
                    required
                    className="flex-grow w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
                <button
                    type="submit"
                    className="bg-red-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150"
                >
                    Subscribe
                </button>
            </form>
            {message && (
                <p className={`mt-3 text-sm font-semibold ${isSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default SubscriptionForm;