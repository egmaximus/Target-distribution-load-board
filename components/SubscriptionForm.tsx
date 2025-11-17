import React, { useState } from 'react';

interface SubscriptionFormProps {
    onSubscribe: (email: string) => Promise<{ success: boolean; message: string }>;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ onSubscribe }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubscribing(true);
        const result = await onSubscribe(email);
        setIsSubscribing(false);

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
                    disabled={isSubscribing}
                    className="flex-grow w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={isSubscribing}
                    className="bg-red-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 disabled:bg-red-400 disabled:cursor-not-allowed"
                >
                    {isSubscribing ? 'Subscribing...' : 'Subscribe'}
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
