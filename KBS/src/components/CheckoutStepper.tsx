import React from 'react';
import { Check } from 'lucide-react';

interface Step {
    id: number;
    name: string;
}

interface CheckoutStepperProps {
    currentStep: number;
}

const steps: Step[] = [
    { id: 1, name: 'Panier' },
    { id: 2, name: 'Informations' },
    { id: 3, name: 'Récapitulatif' },
    { id: 4, name: 'Confirmation' },
];

const CheckoutStepper: React.FC<CheckoutStepperProps> = ({ currentStep }) => {
    return (
        <div className="w-full py-8">
            <div className="flex items-center justify-center max-w-4xl mx-auto px-4">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center relative">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 border-2 ${currentStep > step.id
                                    ? 'bg-kbs-green border-kbs-green text-white shadow-lg shadow-kbs-green/20'
                                    : currentStep === step.id
                                        ? 'bg-white border-kbs-green text-kbs-green shadow-xl ring-4 ring-kbs-green/10'
                                        : 'bg-white border-gray-200 text-gray-400'
                                    }`}
                            >
                                {currentStep > step.id ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    step.id
                                )}
                            </div>
                            <span
                                className={`absolute -bottom-7 text-[10px] sm:text-xs font-bold whitespace-nowrap uppercase tracking-wider transition-colors duration-500 ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                                    }`}
                            >
                                {step.name}
                            </span>
                        </div>

                        {index < steps.length - 1 && (
                            <div className="flex-1 h-0.5 mx-4 sm:mx-8 bg-gray-100 relative overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 h-full bg-kbs-green transition-all duration-700 ease-in-out"
                                    style={{ width: currentStep > step.id ? '100%' : '0%' }}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CheckoutStepper;
