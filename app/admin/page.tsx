
import { sheets } from "@/lib/googleSheets";

async function getStudents() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:C", // Change Sheet1 if your tab has a different name
    });
    const rows = response.data.values ?? [];
    return rows;
  } catch (error) {
    console.error("Error fetching students:", error);
  }
}
export default async function Students() {
  const students = await getStudents();
  return (
    <div>
      <h1>Students</h1>

      <table>
        <tbody>
          {students?.map((row, index) => (
            <tr key={index}>
              {row.map((cell, i) => (
                <td
                  key={i}
                  style={{ border: "1px solid #ccc", padding: "8px" }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
