import { Pencil, RotateCw } from "lucide-react";
import { Card } from "@material-tailwind/react";

// Helper function to access nested properties
const getNestedValue = (path, obj) => {
  return path.split(".").reduce((res, key) => res[key], obj);
};

export default function DynamicTable(props) {
  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          className="mx-5"
          onClick={props.getMenuByRestoId}
          disabled={props.isLoading}
        >
          <RotateCw
            className={props.isLoading ? "animate-spin" : ""}
            onClick={() => props.refresh()}
          />
        </button>
      </div>
      <div className="relative">
        {/* Loading table animation */}
        {props.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="loader">Loading...</div>
          </div>
        )}
        <Card
          className={`h-full w-screen sm:w-full overflow-x-scroll ${
            props.isLoading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <table>
            <thead>
              <tr>
                {props.header.map((head, index) => (
                  <th
                    key={index}
                    className="p-4 border-b border-blue-gray-100 bg-blue-gray-50"
                  >
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      {head.title}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {props.items.map((item, rowIndex) => (
                <tr key={rowIndex}>
                  {props.header.map((head, colIndex) => (
                    <td
                      key={colIndex}
                      className="p-4 border-b border-blue-gray-50"
                    >
                      {head.render ? (
                        head.render(item)
                      ) : (
                        <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                          {getNestedValue(head.value, item)}
                        </p>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
