
class AudioBufferToWavConverter
{
	constructor(samplesAre32BitFloatsNot16BitPcm)
	{
		this.samplesAre32BitFloatsNot16BitPcm =
			samplesAre32BitFloatsNot16BitPcm || false;
	}

	convertAudioBuffer(buffer)
	{
		var wavFormatCode =
			this.samplesAre32BitFloatsNot16BitPcm
			? 3
			: 1;

		var bitDepth =
			wavFormatCode == 3
			? 32
			: 16;

		var channelCount = buffer.numberOfChannels;

		var samples;
		if (channelCount == 2)
		{
			var channel0Data = buffer.getChannelData(0);
			var channel1Data = buffer.getChannelData(1);
			samples =
				this.interleaveNumberArrays
				(
					channel0Data, channel1Data
				);
		}
		else
		{
			samples = buffer.getChannelData(0);
		}

		var audioInWavFormat =
			this.encodeInWavFormat
			(
				samples,
				wavFormatCode,
				buffer.sampleRate,
				channelCount,
				bitDepth
			);

		return audioInWavFormat;
	}

	encodeInWavFormat
	(
		samples,
		wavFormatCode,
		sampleRate,
		channelCount,
		bitsPerSample
	)
	{
		var bytesPerSample = bitsPerSample / 8;

		var buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);

		var view = new DataView(buffer);

		this.writeString(view, 0, "RIFF");
		var riffChunkLength =
			36 + samples.length * bytesPerSample;
		view.setUint32(4, riffChunkLength, true);
		var riffTypeCode = "WAVE";
		this.writeString(view, 8, riffTypeCode);
		this.writeString(view, 12, "fmt ");
		var formatChunkLength = 16;
		view.setUint32(16, formatChunkLength, true);
		view.setUint16(20, wavFormatCode, true);
		view.setUint16(22, channelCount, true);
		view.setUint32(24, sampleRate, true)
		var blockAlign = channelCount * bytesPerSample;
		var byteRate = sampleRate * blockAlign;
		view.setUint32(28, byteRate, true);
		view.setUint16(32, blockAlign, true);
		view.setUint16(34, bitsPerSample, true);
		this.writeString(view, 36, "data");
		var dataChunkLength = samples.length * bytesPerSample;
		view.setUint32(40, dataChunkLength, true);
		if (wavFormatCode === 1)
		{
			// Raw PCM.
			this.floatTo16BitPCM(view, 44, samples);
		}
		else if (wavFormatCode == 3)
		{
			this.writeFloat32(view, 44, samples);
		}
		else
		{
			throw new Error
			(
				"Unsupported WAV format code: " + wavFormatCode
			);
		}

		return buffer;
	}

	interleaveNumberArrays(left, right)
	{
		if (left.length != right.length)
		{
			throw new Error
			(
				"Cannot interleave arrays of different lengths!"
			);
		}

		var lengthBeforeInterleaving = left.length;
		var lengthAfterInterleaving =
			lengthBeforeInterleaving * 2;
		var interleaved =
			new Float32Array(lengthAfterInterleaving);

		for (var i = 0; i < lengthBeforeInterleaving; i++)
		{
			var leftElement = left[i];
			var rightElement = right[i];
			var interleavedIndex = i * 2;
			interleaved[interleavedIndex] = leftElement;
			interleaved[interleavedIndex + 1] = rightElement;
		}

		return interleaved
	}

	writeFloat32(output, offset, input)
	{
		for (var i = 0; i < input.length; i++, offset += 4)
		{
			output.setFloat32(offset, input[i], true);
		}
	}

	floatTo16BitPCM (output, offset, input)
	{
		for (var i = 0; i < input.length; i++, offset += 2)
		{
			var sample = input[i];

			var sampleTrimmed =
				Math.max(-1, Math.min(1, sample) );

			var sampleAs16BitPcm =
				sampleTrimmed < 0
				? sampleTrimmed * 0x8000
				: sampleTrimmed * 0x7FFF;

			output.setInt16
			(
				offset,
				sampleAs16BitPcm,
				true
			)
		}
	}

	writeString (view, offset, stringToWrite)
	{
		for (var i = 0; i < stringToWrite.length; i++)
		{
			var charValueToSet = stringToWrite.charCodeAt(i);
			view.setUint8(offset + i, charValueToSet);
		}
	}
}