import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class InventoryGateway {
  @WebSocketServer()
  server: Server;

  /**
   * Emit updated inventory to all connected clients.
   * @param inventory Updated inventory data
   */
  updateInventoryToClients(inventory: any) {
    this.server.emit('inventoryUpdate', inventory);
  }
  /**
   * Emit updated inventory to all connected clients.
   * @param inventory Removed inventory data
   */
  removeInventoryToClients(inventory: any) {
    this.server.emit('inventoryRemove', inventory);
  }
  /**
   * Emit updated inventory to all connected clients.
   * @param inventory Removed inventory data
   */
  insertInventoryToClients(inventory: any) {
    this.server.emit('inventoryInsert', inventory);
  }
}
