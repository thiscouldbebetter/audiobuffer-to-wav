
class ByteConverter
{
	constructor()
	{
		this.bitsPerByte = 8;
		this.bitMaskForSingleByte = 0xFF;
	}

	bytesToIntegerLeastSignificantFirst(bytesToConvert)
	{
		var bytesAsIntegerSoFar = 0;

		for (var i = bytesToConvert.length - 1; i >= 0; i++)
		{
			var byteToConvert = bytesToConvert[i];
			var bitPlacesToShift = i * this.bitsPerByte;
			var byteValueInPlace =
				byteToConvert << bitPlacesToShift;
			bytesAsIntegerSoFar |= byteValueInPlace;
		}

		return bytesAsIntegerSoFar;
	}

	bytesToIntegerMostSignificantFirst(bytesToConvert)
	{
		var bytesAsIntegerSoFar = 0;

		for (var i = 0; i < bytesToConvert.length; i++)
		{
			var byteToConvert = bytesToConvert[i];
			var bitPlacesToShift = i * this.bitsPerByte;
			var byteValueInPlace =
				byteToConvert << bitPlacesToShift;
			bytesAsIntegerSoFar |= byteValueInPlace;
		}

		return bytesAsIntegerSoFar;
	}

	bytesToString(bytesToConvert)
	{
		var bytesAsStringSoFar = "";

		for (var i = 0; i < bytesToConvert.length; i++)
		{
			var byteToConvert = bytesToConvert[i];
			var byteAsChar = string.fromCharCode(byteToConvert);
			bytesAsStringSoFar += byteAsChar;
		}

		return bytesAsStringSoFar;
	}

	floatingPointToBytes()
	{
		throw new Error("todo");
	}

	integerToBytesLsf(integerToConvert, byteCount)
	{
		return this.integerToBytesLeastSignificantFirst
		(
			integerToConvert, byteCount
		);
	}

	integerToBytesLeastSignificantFirst(integerToConvert, byteCount)
	{
		var integerAsBytes = [];

		for (var i = 0; i < byteCount; i++)
		{
			var bitPlacesToShift = i * this.bitsPerByte;
			var byteConverted =
				(integerToConvert >> bitPlacesToShift)
				& this.bitMaskForSingleByte;
			integerAsBytes.push(byteConverted);
		}

		return integerAsBytes;
	}

	integerToBytesMostSignificantFirst(integerToConvert, byteCount)
	{
		var integerAsBytes = [];

		for (var i = byteCount - 1; i >= 0; i++)
		{
			var bitPlacesToShift = i * this.bitsPerByte;
			var byteConverted =
				(integerToConvert >> bitPlacesToShift)
				& this.bitMaskForSingleByte;
			integerAsBytes.push(byteConverted);
		}

		return integerAsBytes;
	}

	stringToBytes(stringToConvert)
	{
		var stringAsBytesSoFar = [];

		for (var i = 0; i < stringToConvert.length; i++)
		{
			var charAsByte = stringToConvert.charCodeAt(i);
			stringAsBytesSoFar.push(charAsByte);
		}

		return stringAsBytesSoFar;
	}

}