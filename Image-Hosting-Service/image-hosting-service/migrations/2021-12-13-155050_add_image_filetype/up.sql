ALTER TABLE `Images` ADD `FileType` VARCHAR(3) NULL;
UPDATE `Images` SET `FileType` = "jpg" WHERE `FileType` IS NULL;
ALTER TABLE `Images` MODIFY `FileType` VARCHAR(3) NOT NULL;
