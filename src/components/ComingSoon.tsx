import { Construction, Layers, Globe } from 'lucide-react';

const ComingSoon = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Top Navigation Header */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight">
          <Layers className="h-6 w-6" />
          <span>Coming soon</span>
        </div>
        <div className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
          <Globe className="h-4 w-4" />
          <span>Under Construction</span>
        </div>
      </header>

      {/* Main Hero Content */}
      <main className="max-w-3xl mx-auto px-6 text-center flex flex-col items-center justify-center grow -mt-12">
        
        {/* Subtle Status Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-8 animate-pulse">
          <Construction className="h-3.5 w-3.5" />
          Building Something Better
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          Our new digital experience <br />
          <span className="text-blue-600">is on the way.</span>
        </h1>

        {/* Description */}
        <p className="text-lg text-slate-600 max-w-xl leading-relaxed mb-10">
          We are currently polishing up our platform to give you the best experience possible. 
          Everything will be up and running shortly. Thank you for your patience.
        </p>


      </main>

      
    </div>
  );
};

export default ComingSoon;