
class ByteStream
{
	constructor(bytes)
	{
		this.bytes = bytes || [];

		this.byteCurrentIndex = 0;
	}

	byteWrite(byteToWrite)
	{
		this.bytes[this.byteCurrentIndex] = byteToWrite;
		this.byteCurrentIndex++;
		return this;
	}

	bytesWrite(bytesToWrite)
	{
		for (var i = 0; i < bytesToWrite.length; i++)
		{
			var byteToWrite = bytesToWrite[i];
			this.byteWrite(byteToWrite);
		}

		return this;
	}
}