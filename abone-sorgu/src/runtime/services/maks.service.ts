export const fetchMaksAboneApi = async (
  userCode: string,
  userPasswd: string,
) => {
  const binaMaks: number = Number(localStorage.getItem("binaMaks"));

  const response = await fetch(
    "/maks-proxy/maksws/maks/abone?page=0&size=100&sort=%5B%22string%22%5D",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        userCode: userCode,
        userPasswd: userPasswd,
      },
      body: JSON.stringify({
        binaMaks: binaMaks,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Fetch Abone failed");
  }

  return response.json();
};

export const fetchMaksEndeksApi = async (
  aboneNo: string,
  userCode: string,
  userPasswd: string,
) => {
  const response = await fetch(
    "/maks-proxy/maksws/maks/endeks?page=0&size=12&sort=%5B%22string%22%5D",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        userCode: userCode,
        userPasswd: userPasswd,
      },
      body: JSON.stringify({
        aboneNo: aboneNo,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Fetch Endeks failed");
  }

  return response.json();
};
