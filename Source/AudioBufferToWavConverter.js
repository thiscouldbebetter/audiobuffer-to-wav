
class AudioBufferToWavConverter
{
	constructor(samplesAre32BitFloatsNot16BitPcm)
	{
		this.samplesAre32BitFloatsNot16BitPcm =
			samplesAre32BitFloatsNot16BitPcm || false;

		if (this.samplesAre32BitFloatsNot16BitPcm)
		{
			throw new Error("Not yet supported!");
		}
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

		var wavFileAsStream = new ByteStream();
		var converter = new ByteConverter();

		var riffChunkLength =
			36 + samples.length * bytesPerSample;
		var riffTypeCode = "WAVE";
		var formatChunkLength = 16;
		var blockAlign = channelCount * bytesPerSample;
		var byteRate = sampleRate * blockAlign;
		var dataChunkLength = samples.length * bytesPerSample;

		wavFileAsStream
			.bytesWrite(converter.stringToBytes("RIFF") )
			.bytesWrite(converter.integerToBytesLsf(riffChunkLength, 4) )
			.bytesWrite(converter.stringToBytes(riffTypeCode) )
			.bytesWrite(converter.stringToBytes("fmt ") )
			.bytesWrite(converter.integerToBytesLsf(formatChunkLength, 4) )
			.bytesWrite(converter.integerToBytesLsf(wavFormatCode, 2) )
			.bytesWrite(converter.integerToBytesLsf(channelCount, 2) )
			.bytesWrite(converter.integerToBytesLsf(sampleRate, 4 ) )
			.bytesWrite(converter.integerToBytesLsf(byteRate, 4) )
			.bytesWrite(converter.integerToBytesLsf(blockAlign, 2 ) )
			.bytesWrite(converter.integerToBytesLsf(bitsPerSample, 2) )
			.bytesWrite(converter.stringToBytes("data") )
			.bytesWrite(converter.integerToBytesLsf(dataChunkLength, 4) );

		if (wavFormatCode === 1)
		{
			this.samplesFromFloatsToInt16sAndWrite
			(
				samples, wavFileAsStream, converter
			);
		}
		else if (wavFormatCode == 3)
		{
			this.samplesWriteAsIs
			(
				samples, wavFileAsStream, converter
			);
		}
		else
		{
			throw new Error
			(
				"Unsupported WAV format code: " + wavFormatCode
			);
		}

		var wavFileAsBytes = wavFileAsStream.bytes;

		var wavFileAsBuffer = new ArrayBuffer(wavFileAsBytes.length);
		var wavFileAsDataView = new DataView(wavFileAsBuffer);
		for (var i = 0; i < wavFileAsBytes.length; i++)
		{
			var byteToWrite = wavFileAsBytes[i];
			wavFileAsDataView.setUint8(i, byteToWrite);
		}

		return wavFileAsBuffer;
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

		return interleaved;
	}

	samplesFromFloatsToInt16sAndWrite
	(
		samplesToConvertAsFloats, streamToWriteTo, converter
	)
	{
		for (var i = 0; i < samplesToConvertAsFloats.length; i++)
		{
			var sampleAsFraction =
				samplesToConvertAsFloats[i];

			var sampleAsFractionTrimmed =
				Math.max(-1, Math.min(1, sampleAsFraction) );

			var multiplier =
				sampleAsFractionTrimmed < 0
				? 0x8000
				: 0x7FFF;

			var sampleAs16BitPcm =
				sampleAsFractionTrimmed * multiplier;

			var sampleAsBytes =
				converter.integerToBytesLsf(sampleAs16BitPcm, 2);

			streamToWriteTo.bytesWrite(sampleAsBytes);
		}
	}

	samplesWriteAsIs(samplesToWriteAsFloat32s, streamToWriteTo, converter)
	{
		for (var i = 0; i < samplesToWriteAsFloat32s.length; i++)
		{
			var sampleAsFloat32 = samplesToWriteAsFloat32s[i];
			var sampleAsBytes = converter.floatingPointToBytes(4);
			streamToWriteTo.bytesWrite(sampleAsFloat32);
		}
	}
}