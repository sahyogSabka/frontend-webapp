import { Card, Typography, Button } from "@material-tailwind/react";
import { Pencil } from "lucide-react";
import { DialogBox } from "../components/Dialog";
import { RotateCw } from "lucide-react";
const TABLE_HEAD = ["Name / Price (in ₹)", "Description", "In Stock", "Action"];

export function Table(props) {
  return (
    <>
      <div className="flex justify-end mb-4">
        <button className="mx-5" onClick={props.getMenuByRestoId}>
          <RotateCw />
        </button>
        <DialogBox getMenuByRestoId={props.getMenuByRestoId} />
      </div>
      <Card className="h-full w-full overflow-scroll">
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.data.map(({ _id, name, description: desc, price, size, category, isVeg, inStock }, index) => {
              const isLast = index === props.data.length - 1;
              const classes = isLast
                ? "p-4"
                : "p-4 border-b border-blue-gray-50";

              return (
                <tr key={name}>
                  <td className={classes}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {name}
                      <br />
                      {price}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {desc}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className={inStock? 'text-green-500 font-bold' : 'text-slate-400 font-bold'}
                    >
                      {inStock ? 'Yes': 'No'}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      as="a"
                      href="#"
                      variant="small"
                      color="blue-gray"
                      className="font-medium w-4"
                    >
                      {/* <Pencil className="h-4" /> */}
                      <DialogBox
                        getMenuByRestoId={props.getMenuByRestoId} data={{_id, name, description: desc, price, size, category, isVeg, inStock }}
                      />
                    </Typography>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}