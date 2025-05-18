// components/PortfolioCard.tsx
interface PortfolioCardProps {
  title: string;
  values: { label: string; value: string | number }[];
}

export const PortfolioCard = ({ title, values }: PortfolioCardProps) => (
  <div className="bg-white rounded-lg shadow p-6 mb-6">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="space-y-3">
      {values.map((item, index) => (
        <div key={index} className="flex justify-between">
          <span className="text-gray-600">{item.label}</span>
          <span className="font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);