"use server"; // this means it will only be run on the server (it is by default, but the guider still did it)

interface User {
    id: string;
    email: string;
}

export const get= async (): Promise<User[]> => {
    const data = await fetch(`${process.env.APP_URL}/user`);
    const json = await data.json();
    console.log(json);
    return json.data;
};