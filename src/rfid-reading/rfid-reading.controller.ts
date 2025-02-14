import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { Client } from 'ssh2';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { RfidReadingService } from './rfid-reading.service';
import { CreateRfidReadingDto } from './dto/create-rfid-reading.dto';
import { UpdateRfidReadingDto } from './dto/update-rfid-reading.dto';

@Controller('rfid-reading')
export class RfidReadingController {
  constructor(private readonly rfidReadingService: RfidReadingService) { }

  @Post()
  create(@Body() createRfidReadingDto: CreateRfidReadingDto) {
    return this.rfidReadingService.create(createRfidReadingDto);
  }

  @Post('rfid')
  updateInventory(@Body('tag') rawData: string) {
    // Split the data by line breaks
    const lines = rawData.split('\n');

    // Filter and clean valid tags
    const cleanTags = lines
      .map((line) => line.trim()) // Remove extra spaces and line breaks
      .filter((tag) => tag.startsWith('U3000')); // Keep only valid tags

    console.log('Cleaned RFID Tags:', cleanTags);

    // Example: Call the service to process the cleaned tags
    return this.rfidReadingService.saveRfidReading(cleanTags);

    return { tags: cleanTags }; // Return the cleaned tags as a response
  }

  @Post('update')
  async updateRfid(@Body('text') text: string): Promise<string> {
    const sshClient = new Client();
    const raspberryPiIp = '192.168.100.75'; // Replace with your Raspberry Pi's IP address
    const sshUsername = 'zuyao'; // The username for your Raspberry Pi (usually 'pi')

    // Path to your private key file (on your NestJS server)
    const privateKeyPath = path.join(os.homedir(), '.ssh', 'id_rsa');

    return new Promise((resolve, reject) => {
      sshClient
        .on('ready', () => {
          const command = `python3 ~/Documents/rfid_write.py ${text}`;

          // Execute the Python script remotely via SSH
          sshClient.exec(command, (err, stream) => {
            if (err) {
              reject(`SSH Command Error: ${err.message}`);
              return;
            }

            let output = '';
            let error = '';

            stream.on('data', (data) => {
              output += data.toString();
            });

            stream.on('stderr', (data) => {
              error += data.toString();
            });

            stream.on('close', (code) => {
              sshClient.end();
              if (code === 0) {
                resolve(output.trim());
              } else {
                reject(`Error: ${error}`);
              }
            });
          });
        })
        .connect({
          host: raspberryPiIp,
          port: 22,
          username: sshUsername,
          privateKey: fs.readFileSync(privateKeyPath), // Use the private key file
        });
    });
  }

  @Get()
  findAll() {
    return this.rfidReadingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rfidReadingService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRfidReadingDto: UpdateRfidReadingDto,
  ) {
    return this.rfidReadingService.update(+id, updateRfidReadingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rfidReadingService.remove(+id);
  }
}
