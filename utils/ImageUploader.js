import fetchJson, { FetchError } from "./fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";

export default class ImageUploader {
	static async upload(file) {
		const formData = new FormData();

		formData.append("image", file);

		try {
			return await fetchJson("https://api.imgur.com/3/image", {
				method: "POST",
				headers: {
					Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
				},
				body: formData,
			});
		} catch (err) {
            if (err instanceof FetchError) {
                throw new Error("Upload error: " + e.message);
            }

			throw err;
		}
	}

	static async uploadLocaly(file) {
		try {
			const fileReader = new FileReader();
			
			return await new Promise((resolve, reject) => {
				fileReader.onload = (({ target }) => {
					resolve(target);
				});
				fileReader.readAsDataURL(file);
			});
		} catch (err) {
			throw err;
		}
	}
}