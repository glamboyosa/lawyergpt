"use client";

import { Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function FileUploadClient() {
	const [files, setFiles] = useState<Array<File>>([]);
	const [uploading, setUploading] = useState(false);

	const onDrop = useCallback((acceptedFiles: Array<File>) => {
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
		setFiles(files);
		setUploading(true);
		const formData = new FormData();
		for (let i = 0; i < files.length; i++) {
			formData.append("documents", files[i]);
		}

		// use server action secured with cookie
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"application/pdf": [".pdf"],
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
		},
		disabled: uploading,
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
					: "Drag 'n' drop some law files here, or click to select files"}
			</p>
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
									style={{ pointerEvents: "none" }}
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
