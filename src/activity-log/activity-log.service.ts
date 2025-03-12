import { Injectable } from '@nestjs/common';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';
import { ActivityLog } from './entities/activity-log.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  create(createActivityLogDto: CreateActivityLogDto) {
    return this.activityLogRepository.save(createActivityLogDto);
  }

  findAll() {
    return this.activityLogRepository.find();
  }

  async findByProductId(product_id: string) {
    const result = await this.activityLogRepository.query(
      `SELECT 
    u.first_name, 
    u.last_name, 
    p.name AS product_name,
    al.status,
    COUNT(al.id) AS quantity,
    STRING_AGG(DISTINCT (al.detail::jsonb->>'tag_id')::TEXT, ', ') AS tag_ids, 
    STRING_AGG(DISTINCT (al.detail::jsonb->>'tag_name')::TEXT, ', ') AS tag_names,
    TO_CHAR(TO_TIMESTAMP(al.created_at / 1000), 'YYYY-MM-DD') AS created_day,  -- Extract day
    TO_CHAR(TO_TIMESTAMP(al.created_at / 1000), 'YYYY-MM-DD HH24:MI') AS created_time -- Extract date and time
FROM activity_log al 
INNER JOIN "user" u ON u.id = al.user_id
INNER JOIN tag t ON t.id::TEXT = al.detail::jsonb->>'tag_id'
INNER JOIN product p ON p.id = t.product_id
WHERE p.id = $1
GROUP BY u.first_name, u.last_name, p.name, created_day, created_time, al.status
ORDER BY created_day, created_time;
        `,
      [product_id],
    );

    // Transform into JSON format
    const formattedData = result.reduce((acc, row) => {
      const {
        created_day,
        first_name,
        last_name,
        product_name,
        tag_ids,
        tag_names,
        created_time,
        quantity,
      } = row;

      if (!acc[created_day]) {
        acc[created_day] = {
          first_name,
          last_name,
          times: {},
        };
      }

      if (!acc[created_day].times[created_time]) {
        acc[created_day].times[created_time] = []; // Initialize as an empty array
      }

      // Push the current item into the array for this time slot
      acc[created_day].times[created_time].push({
        product_name,
        tag_ids,
        tag_names,
        quantity,
        status: row.status,
      });

      return acc;
    }, {});

    return formattedData;
  }

  async findByUserId(user_id: string) {
    const result = await this.activityLogRepository.query(
      `SELECT 
    u.first_name, 
    u.last_name, 
    p.name AS product_name,
    al.status,
    COUNT(al.id) AS quantity,
    STRING_AGG(DISTINCT (al.detail::jsonb->>'tag_id')::TEXT, ', ') AS tag_ids, 
    STRING_AGG(DISTINCT (al.detail::jsonb->>'tag_name')::TEXT, ', ') AS tag_names,
    TO_CHAR(TO_TIMESTAMP(al.created_at / 1000), 'YYYY-MM-DD') AS created_day,  -- Extract day
    TO_CHAR(TO_TIMESTAMP(al.created_at / 1000), 'YYYY-MM-DD HH24:MI') AS created_time -- Extract date and time
FROM activity_log al 
INNER JOIN "user" u ON u.id = al.user_id
INNER JOIN tag t ON t.id::TEXT = al.detail::jsonb->>'tag_id'
INNER JOIN product p ON p.id = t.product_id
WHERE al.user_id = $1
GROUP BY u.first_name, u.last_name, p.name, created_day, created_time, al.status
ORDER BY created_day, created_time;
        `,
      [user_id],
    );

    // Transform into JSON format
    const formattedData = result.reduce((acc, row) => {
      const {
        created_day,
        first_name,
        last_name,
        product_name,
        tag_ids,
        tag_names,
        created_time,
        quantity,
      } = row;

      if (!acc[created_day]) {
        acc[created_day] = {
          first_name,
          last_name,
          times: {},
        };
      }

      if (!acc[created_day].times[created_time]) {
        acc[created_day].times[created_time] = []; // Initialize as an empty array
      }

      // Push the current item into the array for this time slot
      acc[created_day].times[created_time].push({
        product_name,
        tag_ids,
        tag_names,
        quantity,
        status: row.status,
      });

      return acc;
    }, {});

    return formattedData;
  }

  findOne(id: string) {
    return this.activityLogRepository.findOne({ where: { id } });
  }

  update(id: string, updateActivityLogDto: UpdateActivityLogDto) {
    return this.activityLogRepository.update(id, updateActivityLogDto);
  }

  remove(id: string) {
    return this.activityLogRepository.delete(id);
  }
}
