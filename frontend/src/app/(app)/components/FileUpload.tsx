"use client";

import { env } from "@/lib/env";
import { Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";
export default function FileUploadClient() {
	const [files, setFiles] = useState<Array<File>>([]);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState(false);

	const onDrop = useCallback(
		async (acceptedFiles: Array<File>, fileRejections: Array<FileRejection>) => {
			console.log(fileRejections);
			if (fileRejections.length > 0) {
				for (const { file, errors } of fileRejections) {
					for (const error of errors) {
						toast.error(error.message);
					}
				}
				return;
			}
			setError(false);
			console.log(acceptedFiles);
			const files = acceptedFiles.map((file) => {
				const nameParts = file.name.split(".");
				const ext = nameParts.pop();
				const nameWithoutExt = nameParts.join(".");
				if (ext && nameWithoutExt.length > 50 - ext?.length - 1) {
					const truncatedName = `${nameWithoutExt.slice(0, 50 - ext?.length - 1)}.${ext}`;
					return new File([file], truncatedName, { type: file.type });
				}
				return file;
			});
			console.log("Files are", files);
			setFiles(files);
			setUploading(true);
			const formData = new FormData();
			for (let i = 0; i < files.length; i++) {
				formData.append("documents", files[i]);
			}

			// use server action secured with cookie
			try {
				const r = await fetch(`${env.NEXT_PUBLIC_UPLOADER_URL}/upload`, {
					method: "POST",
					body: formData,
					headers: {
						"x-api-key": env.NEXT_PUBLIC_API_KEY,
					},
					cache: "no-store",
				});
				if (r.status !== 202) {
					throw new Error("Something went wrong uploading files");
				}
				toast("File upload in the works");
				setTimeout(() => {
					setFiles([]);
					setUploading(false);
					setError(false);
				}, 2000);
			} catch (error) {
				const e = error as Error;
				toast.error(e.message);
				setError(true);
				setUploading(false);
			}
		},
		[],
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"application/pdf": [".pdf"],
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
		},
		disabled: uploading,
		maxFiles: 3,
	});

	const removeFile = (file: File) => {
		setFiles(files.filter((f) => f !== file));
	};

	return (
		<div
			{...getRootProps()}
			className={`cursor-pointer rounded-lg border-4 border-stone-400 bg-white p-6 text-center shadow-[8px_8px_0px_0px_rgba(120,113,108,1)] transition-all duration-200 ${
				isDragActive ? "scale-95 bg-stone-100" : ""
			}`}
		>
			<input {...getInputProps()} />
			<Upload
				className={`mx-auto h-12 w-12 ${isDragActive ? "text-stone-600" : "text-stone-400"}`}
			/>
			<p className="mt-2 font-bold text-sm text-stone-800">
				{isDragActive
					? "Drop the files here..."
					: "Drag 'n' drop some legal docs here, or click to select files"}
			</p>
			<p className="mt-1 font-bold text-stone-800 text-xs">(We support PDFs and DOCX)</p>
			{files.length > 0 && (
				<div className="mt-4">
					<h4 className="mb-2 font-bold text-sm text-stone-800">Files:</h4>
					<ul className="space-y-2">
						{files.map((file) => (
							<li
								key={file.name}
								className="flex items-center justify-between rounded bg-stone-100 p-2"
							>
								<span className="truncate text-sm text-stone-600">{file.name}</span>
								<button
									type="button"
									style={{ pointerEvents: error ? "auto" : "none" }}
									onClick={() => removeFile(file)}
									className="text-stone-400 hover:text-stone-600"
								>
									<X className="h-4 w-4" />
								</button>
							</li>
						))}
					</ul>
				</div>
			)}
			{/* {uploading && (
        <div className="mt-4 relative pt-1">
          <div className="overflow-hidden h-2 text-xs flex rounded-full bg-stone-200 border-2 border-stone-400">
            <div
              style={{ width: `${uploadProgress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-stone-400 to-stone-600 animate-gradient-conic"
            ></div>
          </div>
        </div>
      )} */}
		</div>
	);
}
