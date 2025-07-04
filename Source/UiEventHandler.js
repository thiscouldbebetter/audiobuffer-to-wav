
class UiEventHandler
{
	static inputFile_Changed(inputFile)
	{
		var file = inputFile.files[0];
		if (file != null)
		{
			var fileReader = new FileReader();
			fileReader.onload = (event) =>
			{
				var fileAsArrayBuffer =
					event.target.result;

				UiEventHandler
					.inputFile_Changed_Loaded(fileAsArrayBuffer);
			};
			fileReader.readAsArrayBuffer(file);
		}
	}

	static inputFile_Changed_Loaded(fileAsArrayBuffer)
	{
		var d = document;
		var link = d.createElement("a");
		d.body.appendChild(link);
		link.style = "display: none";

		var audioContext = new AudioContext();
		audioContext.decodeAudioData
		(
			fileAsArrayBuffer,
			(buffer) =>
			{
				var converter =
					new AudioBufferToWavConverter();
				var audioAsWav =
					converter.convertAudioBuffer(buffer);
				var audioAsDataView =
					new DataView(audioAsWav);
				var blob = new Blob
				(
					[ audioAsDataView ],
					{ type: "audio/wav" }
				);
				var url = URL.createObjectURL(blob);
				link.href = url;
				link.download = "Converted.wav";
				link.click();
				URL.revokeObjectURL(url);
			},
			// error
			() => { throw new Error("Could not decode audio data.") }
		);
	}
}
