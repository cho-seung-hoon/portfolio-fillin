package com.kosa.fillinv.schedule.repository;

import com.kosa.fillinv.schedule.entity.ScheduleTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ScheduleTimeRepository  extends JpaRepository<ScheduleTime, String>, JpaSpecificationExecutor<ScheduleTime> {
}
